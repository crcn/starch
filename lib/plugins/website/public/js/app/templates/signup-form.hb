<form {{bindAttr action="view.action"}} method="POST" id="payment-form">
  
  <!-- account info -->
  <div class="form-row">
    <label>Email</label>
    {{view Ember.TextField valueBinding="email" name="email" size="20" }}
  </div>
  <div class="form-row">
    <label>Full Name</label>
    {{view Ember.TextField valueBinding="full-name" name="fullName" size="20" }}
  </div>

  <!-- ccard info -->
  <div class="form-row">
    <label>Full Name on Card</label>
    {{view Ember.TextField valueBinding="card-full-name" name="cardFullName" size="20" }}
  </div>
  <div class="form-row">
    <label>Card Number</label>
    {{view Ember.TextField valueBinding="card-number" size="20" autocomplete="off"  }}
  </div>
  <div class="form-row">
    <label>CVC</label>
    {{view Ember.TextField valueBinding="card-cvc" size="4" autocomplete="off" }}
  </div>
  <div class="form-row">
    <label>Expiration (MM/YYYY)</label>
    {{view Ember.TextField valueBinding="card-expiry-month" size="2" autocomplete="off" }}
    <span> / </span>
    {{view Ember.TextField valueBinding="card-expiry-year" size="4" autocomplete="off" }}
  </div>
  {{view Ember.Select
       contentBinding="plans"
       optionLabelPath="content.displayName"
       optionValuePath="content.id"
       selectionBinding="plan"}}

   <br />

  <!--button type="submit" class="submit-button">Submit Payment</button-->
  <button {{action "submitPayment" target=view}}>Submit Payment</button>
</form>