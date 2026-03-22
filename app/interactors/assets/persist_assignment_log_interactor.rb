# frozen_string_literal: true

class Assets::PersistAssignmentLogInteractor
  include Interactor

  # Reads:  context.assignment_params, context.asset, context.current_user
  # Writes: context.assignment_log
  def call
    log = context.asset.asset_assignment_logs.new(context.assignment_params)
    log.assigned_by = context.current_user
    log.save!
    context.assignment_log = log
  end
end
