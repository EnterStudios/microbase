# payment.authorize

This method is used to authorize a transaction.

# Arguments

This method has the URL https://server/services/payment/v1/payment.authorize and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
gateway  | yes | String  | stripe    | The transactions gateway to use.
params   | yes | String  | see below | Gateway specific data.

## Stripe example

```json
{
  "gateway": "stripe", 
  "params": {
		"source": "tok_...",
	  "amount": 10000,
		"currency":"EUR"
	}
}
```

# Response

The response is also gateway dependant.

## Stripe example

```json
{
  "ok": true,
  "data": {
    "id": "ch_...",
    "object": "charge",
    "amount": 10000,
    "amount_refunded": 0,
    "application": null,
    "application_fee": null,
    "balance_transaction": null,
    "captured": false,
    "created": 1486216147,
    "currency": "eur",
    "customer": null,
    "description": null,
    "destination": null,
    "dispute": null,
    "failure_code": null,
    "failure_message": null,
    "fraud_details": {},
    "invoice": null,
    "livemode": false,
    "metadata": {},
    "on_behalf_of": null,
    "order": null,
    "outcome": {
      "network_status": "approved_by_network",
      "reason": null,
      "risk_level": "normal",
      "seller_message": "Payment complete.",
      "type": "authorized"
    },
    "paid": true,
    "receipt_email": null,
    "receipt_number": null,
    "refunded": false,
    "refunds": {
      "object": "list",
      "data": [],
      "has_more": false,
      "total_count": 0,
      "url": "/v1/charges/ch_19jTuZ2eZvKYlo2C6aVimADK/refunds"
    },
    "review": null,
    "shipping": null,
    "source": {
      "id": "card_...",
      "object": "card",
      "address_city": null,
      "address_country": null,
      "address_line1": null,
      "address_line1_check": null,
      "address_line2": null,
      "address_state": null,
      "address_zip": null,
      "address_zip_check": null,
      "brand": "Visa",
      "country": "US",
      "customer": null,
      "cvc_check": "pass",
      "dynamic_last4": null,
      "exp_month": 12,
      "exp_year": 2018,
      "fingerprint": "Xt5EWLLDS7FJjR1c",
      "funding": "credit",
      "last4": "4242",
      "metadata": {},
      "name": null,
      "tokenization_method": null
    },
    "source_transfer": null,
    "statement_descriptor": null,
    "status": "succeeded",
    "transfer_group": null
  }
}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
invalid_gateway | The gateway code | The gateway doesn￿'t exist

# Example

```bash
curl --request POST \
  --url http://localhost:3000/services/payment/v1/payment.authorize \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{...}'
```