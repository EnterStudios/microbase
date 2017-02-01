# payment.remove

This method is used to remove a Payment Method

# Arguments

This method has the URL https://server/services/payment/v1/payment.remove and 
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token     | yes | Token  | Bearer xxxxx... | Authentication token.
id | no  | String | iw3RA1EE        | The id of the Payment Method to remove.

# Response

Returns a default response:

```json
{
    "ok": true
}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
payment_method_not_found | The id not found | The Payment Method was not found

# Example
```bash
curl --request POST \
  --url 'http://localhost:3000/services/payment/v1/category.payment?id=ia5RA1W9 \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json'
```
