# payment.update

This method is used to get a list of Payment Methods.

# Arguments

This method has the URL https://server/services/payment/v1/payment.list and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token        | yes  | Token        | Bearer xxxxx... | Authentication token.
id           | no   | String List  | rJGOMDf         | Comma separated Payment Method ids list.
title        | no   | String       | Credit          | Title /${title}/i regex expression.
gateway      | no   | String       | stripe          | Title /${gateway}/i regex expression.
active       | no   | Boolean      | default         | Active or disabled.

# Response

Returns a Payment object:

```json
{
  "ok": true,
  "data": [
    {
      "id" : "ia5RA1W9",
      "title" : "Credit Card",
      "gateway" : "stripe",
      "active" : true
    }
  ]
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
  --url http://localhost:3000/services/payment/v1/payment.list \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{
      "id": "HJs04P45,GFssj54j" \
      }'
```
