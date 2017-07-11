# customer.checkCredentials

This method is used to check user credentials.

# Arguments

This method has the URL https://server/services/customer/v1/customer.checkCredentials and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
email      | yes  | String      | john.doe@gmail.com   | Customer email.
password   | yes  | String      | mypassword           | Customer password.

# Response

Returns a boolean object:

```javascript
{
    "ok": true
}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
validation_error | The data causing the error | Some validation error
bad_credentials  | The data causing the error | Bad credentials

# Example

```bash
curl --request POST \
  --url http://localhost:3005/services/customer/v1/customer.checkCredentials \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{
        "email": "john.doe@gmail.com",
        "password": "mypassword"
      }'
```
