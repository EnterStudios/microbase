# payment.update

This method is used to update an existent Payment Method.

# Arguments

This method has the URL https://server/services/payment/v1/payment.update and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
title    | yes | String    | Credit Card     | Payment method title.
gateway  | yes | String    | stripe          | Processing gateway code.   
active   | yes | Boolean   | true            | Active or disabled.

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
payment_not_found | The data causing the error | Payment to update not found

# Example

```bash
curl --request POST \
  --url http://localhost:3000/services/payment/v1/payment.update \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{"id": "HJs04P45", "gateway": "paypal"}'
```
