import json


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


def get_appointment_handler(appointment_id):
    return {
        'statusCode': 200,
        'body': json.dumps({'message': f'GET appointment with ID {appointment_id}'}),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }


def create_appointment_handler(request_body):
    return {
        'statusCode': 201,
        'body': json.dumps({'message': 'appointment created'}),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
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
