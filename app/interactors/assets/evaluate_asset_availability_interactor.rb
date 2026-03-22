# frozen_string_literal: true

class Assets::EvaluateAssetAvailabilityInteractor
  include Interactor

  # Reads:  context.asset, context.assignment_log
  # Writes: context.all_returned (boolean)
  def call
    open_assignments = context.asset.asset_assignment_logs
                                    .where(returned_at: nil)
                                    .where.not(id: context.assignment_log.id)
    context.all_returned = open_assignments.none?
  end
end
