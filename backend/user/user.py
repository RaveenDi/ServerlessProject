import json

import boto3
from botocore.exceptions import ClientError


dynamo_db = boto3.resource('dynamodb', region_name='us-east-1')
user_table = dynamo_db.Table('user-details')


def handler(event, context):
    http_method = event['httpMethod']
    path = event['path']

    if http_method == 'GET' and path.startswith('/user/'):
        user_id = path.split('/')[2]
        return get_user_handler(user_id)

    elif http_method == 'POST' and path == '/user':
        return create_user_handler(event['body'])

    elif http_method == 'DELETE' and path.startswith('/user/'):
        user_id = path.split('/')[2]
        return delete_user_handler(user_id)

    elif http_method == 'PUT' and path.startswith('/user/'):
        user_id = path.split('/')[2]
        return update_user_handler(user_id, event['body'])

    else:
        return {
            'statusCode': 404,
            'body': json.dumps({'message': 'Not Found'}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }


def get_user_handler(user_id):
    try:
        response = user_table.get_item(
            Key={
                'ID': user_id
            }
        )

        if 'Item' in response:
            item = response['Item']
            return {
                'statusCode': 200,
                'body': json.dumps(item),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        else:
            return {
                'statusCode': 404,
                'body': json.dumps('Item not found')
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


def create_user_handler(request_body):
    return {
        'statusCode': 201,
        'body': json.dumps({'message': 'user created'}),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }


def delete_user_handler(user_id):
    return {
        'statusCode': 204,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }


def update_user_handler(user_id, request_body):
    return {
        'statusCode': 200,
        'body': json.dumps({'message': f'user with ID {user_id} updated'}),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }
