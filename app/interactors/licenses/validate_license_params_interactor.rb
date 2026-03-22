# frozen_string_literal: true

class Licenses::ValidateLicenseParamsInteractor
  include Interactor

  # Reads:  context.license_params, context.license (optional, nil on create)
  # Writes: nothing (fails context on invalid params)
  def call
    license = context.license || License.new
    license.assign_attributes(context.license_params)

    context.fail!(message: license.errors.full_messages.join(", ")) unless license.valid?
  end
end
