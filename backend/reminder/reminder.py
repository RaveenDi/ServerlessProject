import json
import os

import boto3
import logging
from botocore.exceptions import ClientError
from datetime import datetime, timedelta
from dateutil import tz

logging.getLogger().setLevel(logging.INFO)

email_source = os.environ['email_source']
template = os.environ['template']

from_zone = tz.gettz('UTC')
to_zone = tz.gettz('Asia/Colombo')


def handler(event, context):
    logging.info(f"Event: {event}")
    # Initialize DynamoDB and SES clients
    dynamodb = boto3.client('dynamodb')
    ses = boto3.client('ses')

    try:

        # Get triggering date from event
        utc = datetime.strptime(event["triggerDate"], '%Y-%m-%dT%H:%M:%SZ')
        utc = utc.replace(tzinfo=from_zone)
        today_date = utc.astimezone(to_zone).strftime('%Y-%m-%dT%H:%M:%SZ').split("T")[0]
        logging.info(f"Execution date: {today_date}")

        # Query appointments for today using GSI
        response = dynamodb.query(
            TableName='appointment-details',
            IndexName='DateIndex',
            KeyConditionExpression='#date = :today',
            ProjectionExpression='doctorId, sessionDateTime, patientIds',
            ExpressionAttributeNames={
                '#date': 'date'
            },
            ExpressionAttributeValues={
                ':today': {"S": today_date}
            }
        )

        # Process each appointment
        for appointment in response.get('Items', []):
            doctor_id = appointment['doctorId']['S']
            appointment_datetime = appointment['sessionDateTime']['S']
            dt = datetime.strptime(appointment_datetime.split("T")[1], "%H:%M:%S")
            session_time = dt.strftime("%I:%M:%S %p")
            patient_ids = appointment['patientIds']['L']

            response = dynamodb.get_item(
                TableName="doctor-details",
                Key={
                    'ID': {'S': doctor_id}
                }
            )

            doctor_name = response['Item']['name']['S']

            # Send emails to each user in the appointment
            bulk_email_requests = []
            if len(patient_ids) > 0:
                for appointment_number in range(len(patient_ids)):
                    patient_id = patient_ids[appointment_number]
                    display_appointment_number = str(appointment_number + 1).zfill(2)
                    appointment_time = (dt + timedelta(minutes=10 * appointment_number)).strftime("%I:%M:%S %p")
                    response = dynamodb.get_item(
                        TableName="user-details",
                        Key={
                            'ID': patient_id
                        }
                    )

                    patient_data = response['Item']
                    patient_name = patient_data['name']['S']
                    patient_email = patient_data['email']['S']

                    bulk_email_requests.append({
                        'Destination': {
                            'ToAddresses': [patient_email]
                        },
                        'ReplacementTemplateData': json.dumps({
                            'name': patient_name,
                            'today_date': today_date,
                            'session_time': session_time,
                            'doctor_name': doctor_name,
                            'appointment_number': display_appointment_number,
                            'appointment_time': appointment_time
                        })
                    })

                    logging.info(
                        f"REMINDER\nHi {patient_name},\nYou have scheduled an appointment for the session {today_date}"
                        f"@{session_time} with {doctor_name}.\nAPPOINTMENT NUMBER : {display_appointment_number}\n"
                        f"ESTIMATED APPOINTMENT TIME : {appointment_time}")

                # Send bulk emails using Amazon SES
                ses.send_bulk_templated_email(
                    Source=email_source,  # SES verified sender email
                    Template=template,  # SES template name
                    Destinations=bulk_email_requests,
                    DefaultTemplateData=json.dumps({
                        'name': 'patient_name',
                        'today_date': 'today_date',
                        'session_time': 'session_time',
                        'doctor_name': 'doctor_name',
                        'appointment_number': 'appointment_number',
                        'appointment_time': 'appointment_time'
                    })
                )

    except ClientError as e:
        logging.error(f"Error querying appointments or sending SES messages: {e}")
        raise

# for local execution only
# handler({'triggerDate': '2023-12-18T19:01:00Z'}, "")
