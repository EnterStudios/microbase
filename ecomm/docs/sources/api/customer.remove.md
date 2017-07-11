# customer.remove

This method is used to remove a customer.

# Arguments

This method has the URL https://server/services/customer/v1/customer.remove and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
id        | yes  | String      | HkhhuXESl            | Customer identifier.

# Response

Returns a customer object:

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
customer_not_found | The data causing the error | Customer not found

# Example

```bash
curl --request POST \
  --url http://localhost:3005/services/customer/v1/customer.remove \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{
        "id": "HkhhuXESl"
      }'
```
