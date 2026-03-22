# frozen_string_literal: true

class AssetRequests::ValidateApprovalAuthorizationInteractor
  include Interactor

  # Reads:  context.current_user
  # Writes: nothing (fails context if user is not manager or executive)

  def call
    return if context.current_user.role.in?(%w[manager executive])

    context.fail!(message: "You are not authorized to approve or reject requests.", http_status: :forbidden)
  end
end
