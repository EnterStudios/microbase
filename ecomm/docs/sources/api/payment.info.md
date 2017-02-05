# payment.info

This method is used to obtain information about a Payment Method

# Arguments

This method has the URL https://server/services/payment/v1/payment.info and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
id | yes | String  | ia5RA1W9        | The Payment Method id to get info on.

# Response

Returns a Payment Method object:

```json
{
  "ok": true,
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
payment_method_not_found | - | The Payment Method was not found

# Example

```bash
curl --request GET \
  --url http://localhost:3000/services/payment/v1/payment.info?id=ia5RA1W9 \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json'
```