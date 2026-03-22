# frozen_string_literal: true

class Licenses::PersistLicenseInteractor
  include Interactor

  # Reads:  context.license_params, context.license (nil = create, present = update)
  # Writes: context.license
  def call
    if context.license
      context.license.update!(context.license_params)
    else
      context.license = License.create!(context.license_params)
    end
  end
end
