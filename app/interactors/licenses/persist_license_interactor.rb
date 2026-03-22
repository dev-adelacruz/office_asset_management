# frozen_string_literal: true

class Licenses::PersistLicenseInteractor
  include Interactor

  # Reads:  context.license_params, context.license (nil = create, present = update)
  # Writes: context.license, context.auditable, context.audit_action,
  #         context.changes_before, context.changes_after

  def call
    if context.license
      context.license.update!(context.license_params)
      context.audit_action = "update"
      context.changes_before = context.license.saved_changes.transform_values { |v| v[0] }
      context.changes_after = context.license.saved_changes.transform_values { |v| v[1] }
    else
      context.license = License.create!(context.license_params)
      context.audit_action = "create"
      context.changes_before = {}
      context.changes_after = context.license.attributes
    end
    context.auditable = context.license
  end
end
