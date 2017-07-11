# customer.address.remove

This method is used to remove an address of a customer.

# Arguments

This method has the URL https://server/services/customer/v1/customer.address.remove and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
customerId | yes  | String      | HkhhuXESl            | Customer identifier.
addressId  | yes  | String      | r1h2uQ4rx            | Address identifier.

# Response

Returns a customer object:

```javascript
{
    "ok": true,
    "customer": {
        "email": "john.doe@gmail.com",
        "firstName": "John",
        "lastName": "Doe",
        "status": "ACTIVE",
        "tags": [
            "VIP"
        ],
        "addresses": [],
        "id": "HkhhuXESl"
    }
}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
validation_error | The data causing the error | Some validation error
customer_address_not_found | The data causing the error | Customer address not found

# Example

```bash
curl --request POST \
  --url http://localhost:3005/services/customer/v1/customer.address.remove \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{
        "customerId": "HkhhuXESl",
        "addressId": "B1Q5HiGHg88"
      }'
```
