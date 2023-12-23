import json
import boto3
from botocore.exceptions import ClientError

dynamo_db = boto3.resource('dynamodb', region_name='us-east-1')
appointment_table = dynamo_db.Table('appointment-details')
doctor_table = dynamo_db.Table('doctor-details')


def handler(event, context):
    http_method = event['httpMethod']
    path = event['path']

    if http_method == 'GET' and path.startswith('/appointment/'):
        return get_appointment_handler(event['body'])

    elif http_method == 'POST' and path == '/appointment':
        return create_appointment_handler(event['body'])

    elif http_method == 'DELETE' and path.startswith('/appointment/'):
        return delete_appointment_handler(event['body'])

    # elif http_method == 'PUT' and path.startswith('/appointment/'):
    #     appointment_id = path.split('/')[2]
    #     return update_appointment_handler(appointment_id, event['body'])

    elif http_method == 'GET' and path == '/appointment/sessions':
        return get_doctor_session_handler(event['body'])

    else:
        return {
            'statusCode': 404,
            'body': json.dumps({'message': 'Not Found'}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }


def get_appointment_handler(request_body):
    try:
        appointment_data = json.loads(request_body)

        user_id = appointment_data.get('user_id')

        response = appointment_table.scan(
            FilterExpression='contains(patientIds, :userId)',
            ExpressionAttributeValues={':userId': user_id}
        )

        appointments = response.get('Items', [])

        for appointment in appointments:
            doctor_id = appointment.get('doctorId')
            doctor_response = doctor_table.get_item(
                Key={'ID': doctor_id}
            )

            doctor_item = doctor_response.get('Item', {})  # Retrieve doctor details from the Item key

            appointment['name'] = doctor_item.get('name', '')  # Access name attribute from the doctor's details
            appointment['speciality'] = doctor_item.get('speciality', '')

            count_up_to_user_id = appointment.get('patientIds', []).index(user_id) + 1
            appointment['count'] = count_up_to_user_id
            # Remove patientIds list from response
            del appointment['patientIds']

            time_interval_minutes = 10
            session_datetime = datetime.strptime(appointment['sessionDateTime'], '%Y-%m-%dT%H:%M:%S')
            estimated_time = session_datetime + timedelta(minutes=count_up_to_user_id * time_interval_minutes)
            appointment['estimatedTime'] = estimated_time.strftime('%Y-%m-%dT%H:%M:%S')

        return {
            'statusCode': 200,
            'body': json.dumps({'appointments': appointments}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']

        return {
            'statusCode': 500,
            'body': json.dumps(f'DynamoDB error: {error_code} - {error_message}')
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }


def create_appointment_handler(request_body):
    try:
        # Parse the request body
        appointment_data = json.loads(request_body)

        doctor_id = appointment_data.get('doctorId')
        user_id = appointment_data.get('userId')
        session_datetime = appointment_data.get('sessionDateTime')
        date = appointment_data.get('date')

        existing_appointment = appointment_table.get_item(
            Key={
                'doctorId': doctor_id,
                'sessionDateTime': session_datetime
            }
        )

        if 'Item' in existing_appointment:
            existing_item = existing_appointment['Item']
            existing_patient_ids = existing_item.get('patientIds', [])

            existing_patient_ids.append(user_id)

            appointment_table.update_item(
                Key={
                    'doctorId': doctor_id,
                    'sessionDateTime': session_datetime
                },
                UpdateExpression='SET patientIds = :patientIds',
                ExpressionAttributeValues={
                    ':patientIds': existing_patient_ids
                }
            )

            return {
                'statusCode': 200,
                'body': json.dumps({'success': 'true', 'message': 'User added to existing appointment'}),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }

        else:
            item = {
                'doctorId': doctor_id,
                'sessionDateTime': session_datetime,
                'Date': date,
                'patientIds': [user_id],
            }

            # Insert the item into the DynamoDB table
            appointment_table.put_item(Item=item)
            return {
                'statusCode': 201,
                'body': json.dumps({'success': 'true','message': 'New appointment created'}),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']

        return {
            'statusCode': 500,
            'body': json.dumps({'success': 'false', 'message': f'DynamoDB error: {error_code} - {error_message}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'success': 'false', 'message': f'Error: {str(e)}'})
        }


def delete_appointment_handler(request_body):
    try:
        request_data = json.loads(request_body)

        doctor_id = request_data.get('doctorId')
        session_datetime = request_data.get('sessionDateTime')
        user_id = request_data.get('userId')

        response = appointment_table.get_item(
            Key={
                'doctorId': doctor_id,
                'sessionDateTime': session_datetime
            }
        )

        if 'Item' in response:
            existing_item = response['Item']
            existing_patient_ids = existing_item.get('patientIds', [])
            
            if user_id in existing_patient_ids:
                existing_patient_ids.remove(user_id)
                appointment_table.update_item(
                    Key={
                        'doctorId': doctor_id,
                        'sessionDateTime': session_datetime
                    },
                    UpdateExpression='SET patientIds = :patientIds',
                    ExpressionAttributeValues={
                        ':patientIds': existing_patient_ids
                    }
                )
                return {
                    'statusCode': 200,
                    'body': json.dumps({'success': 'true','message': 'User removed from appointment'}),
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
            else:
                return {
                    'statusCode': 404,
                    'body': json.dumps({'success': 'false','message': 'User not found in appointment'}),
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
        else:
            return {
                'statusCode': 404,
                'body': json.dumps({'success': 'false','message': 'Appointment not found'}),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']

        return {
            'statusCode': 500,
            'body': json.dumps({'success': 'false', 'message': f'DynamoDB error: {error_code} - {error_message}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'success': 'false', 'message': f'Error: {str(e)}'})
        }


# def update_appointment_handler(appointment_id, request_body):
#     return {
#         'statusCode': 200,
#         'body': json.dumps({'message': f'appointment with ID {appointment_id} updated'}),
#         'headers': {
#             'Content-Type': 'application/json',
#             'Access-Control-Allow-Origin': '*'
#         }
#     }

def get_doctor_session_handler(request_body):
    try:
        request_data = json.loads(request_body)

        doctor_id = request_data.get('doctorId')
        user_id = request_data.get('userId')

        response = appointment_table.query(
            IndexName='DateIndex',  # Assuming we have a GSI named 'DateIndex'
            KeyConditionExpression='doctorId = :doctor_id',
            ExpressionAttributeValues={':doctor_id': doctor_id}
        )

        sessions = response.get('Items', [])

        for session in sessions:
            count_up_to_user_id = session.get('patientIds', []).index(user_id) + 1
            session['count'] = count_up_to_user_id
            del session['patientIds']

            # Calculate estimatedTime based on count (assuming 10-minute intervals)
            time_interval_minutes = 10
            session_datetime = datetime.strptime(session['sessionDateTime'], '%Y-%m-%dT%H:%M:%S')
            estimated_time = session_datetime + timedelta(minutes=count_up_to_user_id * time_interval_minutes)
            session['estimatedTime'] = estimated_time.strftime('%Y-%m-%dT%H:%M:%S')

        return {
            'statusCode': 200,
            'body': json.dumps({'sessions': sessions}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']

        return {
            'statusCode': 500,
            'body': json.dumps(f'DynamoDB error: {error_code} - {error_message}')
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }