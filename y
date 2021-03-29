version = 0.1
[default]
[default.deploy]
[default.deploy.parameters]
stack_name = "api-email"
s3_bucket = "aws-sam-cli-managed-default-samclisourcebucket-1beervxex9bn8"
s3_prefix = "api-email"
region = "ap-southeast-2"
confirm_changeset = true
capabilities = "CAPABILITY_IAM"

[y]
[y.deploy]
[y.deploy.parameters]
stack_name = "tracker-1"
s3_bucket = "aws-sam-cli-managed-default-samclisourcebucket-1beervxex9bn8"
s3_prefix = "tracker-1"
region = "ap-southeast-2"
confirm_changeset = true
capabilities = "CAPABILITY_IAM"
