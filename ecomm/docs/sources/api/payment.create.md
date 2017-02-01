# payment.create

This method is used to create a Payment Method.

# Arguments

This method has the URL https://server/services/payment/v1/payment.create and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token    | yes | Token       | Bearer xxxxx... | Authentication token.
title    | yes | String      | Credit Card     | Payment method title.
gateway  | yes | String      | stripe          | Processing gateway code.   
active   | yes | Boolean     | true            | Active or disabled.


# Response

Returns a Payment Method object:

```json
{
  "ok" : true,
  "payment" : {
    "id" : "ia5RA1W9",
    "title" : "Credit Card",
    "gateway" : "stripe",
    "active" : true
  }
}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
validation_error | The data causing the error | Some validation error

# Example

```bash
curl --request POST \
  --url http://localhost:3000/services/payment/v1/payment.create \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{...}'
```
