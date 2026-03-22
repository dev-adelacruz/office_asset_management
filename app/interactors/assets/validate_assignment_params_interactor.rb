# frozen_string_literal: true

class Assets::ValidateAssignmentParamsInteractor
  include Interactor

  # Reads:  context.assignment_params, context.asset, context.current_user
  # Writes: nothing (fails context on invalid params)
  def call
    log = AssetAssignmentLog.new(context.assignment_params)
    log.asset = context.asset
    log.assigned_by = context.current_user

    context.fail!(message: log.errors.full_messages.join(", ")) unless log.valid?
  end
end
