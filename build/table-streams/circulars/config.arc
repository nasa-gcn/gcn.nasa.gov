# This Lambda must be inside a VPC because it must be able to reach our Kafka
# cluster which is inside our VPC and only accessible from NASA sites on dev.
@aws
vpc true
