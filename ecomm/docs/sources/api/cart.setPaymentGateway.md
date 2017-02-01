# cart.setPaymentGateway

This method is used to assign a payment gateway to a Cart.

# Arguments

This method has the URL https://server/services/cart/v1/cart.setPaymentGateway and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token     | yes | Token  | Bearer xxxxx... | Authentication token.
cartId    | yes | String | H19PRsec        | The Cart id to assign the gateway.
paymentId | yes | String | BJgnZdVJ_g      | The payment method id to get the gateway

# Response

Returns a Cart object:

```json
{
  "ok": true,
  "cart": {
    ...
    "gateway": "stripe"
  }
}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
validation_error | The data causing the error | Some validation error
cart_not_found   | The cart Id | The cart was not found
payment_method_not_found  | - | The payment method was not found
payment_method_not_active | - | The payment method is not active

# Example

```bash
curl --request POST \
  --url http://localhost:3000/services/cart/v1/cart.setPaymentGateway \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{"cartId": "H19PRsec", paymentId: "BJgnZdVJ_g"}'
```
