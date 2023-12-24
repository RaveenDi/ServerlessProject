import json
import boto3
from botocore.exceptions import ClientError

dynamo_db = boto3.resource('dynamodb', region_name='us-east-1')
doctor_table = dynamo_db.Table('doctor-details')


def handler(event, context):
    http_method = event['httpMethod']
    path = event['path']

    if http_method == 'GET' and path == '/doctor':
        return get_doctor_handler()

    else:
        return {
            'statusCode': 404,
            'body': json.dumps({'message': 'Not Found'}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }

def get_doctor_handler():
    try:
        # Scan the entire doctor-details table to get all records
        response = doctor_table.scan()

        doctors = response.get('Items', [])

        return {
            'statusCode': 200,
            'body': json.dumps({'success': 'true', 'message': 'successfully fetched doctor details', 'data': doctors}),
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
            'body': json.dumps({'success': 'false', 'message':f'DynamoDB error: {error_code} - {error_message}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'success': 'false', 'message': f'Error: {str(e)}'})
        }