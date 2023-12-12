import arc  # type: ignore
import boto3  # type: ignore

dydbtable = arc.tables.table

# FIXME: Can this be done with arc?
session = boto3.session.Session(profile_name="across")
# Conntect to S3 bucket
s3 = session.resource("s3", region_name="us-east-1")
