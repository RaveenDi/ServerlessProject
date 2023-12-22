import json
import boto3
from botocore.exceptions import ClientError

dynamo_db = boto3.resource('dynamodb', region_name='us-east-1')
appointment_table = dynamo_db.Table('appointments')


def handler(event, context):
    http_method = event['httpMethod']
    path = event['path']

    if http_method == 'GET' and path.startswith('/appointment/'):
        appointment_id = path.split('/')[2]
        return get_appointment_handler(appointment_id)

    elif http_method == 'POST' and path == '/appointment':
        return create_appointment_handler(event['body'])

    elif http_method == 'DELETE' and path.startswith('/appointment/'):
        appointment_id = path.split('/')[2]
        return delete_appointment_handler(appointment_id)

    elif http_method == 'PUT' and path.startswith('/appointment/'):
        appointment_id = path.split('/')[2]
        return update_appointment_handler(appointment_id, event['body'])

    else:
        return {
            'statusCode': 404,
            'body': json.dumps({'message': 'Not Found'}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }


def get_appointment_handler(user_id):
    return {
        'statusCode': 200,
        'body': json.dumps({'message': f'GET appointment with User ID {user_id}'}),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
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
                'body': json.dumps({'message': 'User added to existing appointment'}),
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
                'body': json.dumps({'message': 'New appointment created'}),
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


def delete_appointment_handler(appointment_id):
    return {
        'statusCode': 204,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }


def update_appointment_handler(appointment_id, request_body):
    return {
        'statusCode': 200,
        'body': json.dumps({'message': f'appointment with ID {appointment_id} updated'}),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }
