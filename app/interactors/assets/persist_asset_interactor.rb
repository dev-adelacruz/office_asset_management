# frozen_string_literal: true

class Assets::PersistAssetInteractor
  include Interactor

  # Reads:  context.asset_params, context.asset (nil = create, present = update)
  # Writes: context.asset, context.auditable, context.audit_action,
  #         context.changes_before, context.changes_after

  def call
    if context.asset
      context.asset.update!(context.asset_params)
      context.audit_action = "update"
      context.changes_before = context.asset.saved_changes.transform_values { |v| v[0] }
      context.changes_after = context.asset.saved_changes.transform_values { |v| v[1] }
    else
      context.asset = Asset.create!(context.asset_params)
      context.audit_action = "create"
      context.changes_before = {}
      context.changes_after = context.asset.attributes
    end
    context.auditable = context.asset
  end
end
