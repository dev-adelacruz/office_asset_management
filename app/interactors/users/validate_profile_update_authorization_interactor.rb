# frozen_string_literal: true

class Users::ValidateProfileUpdateAuthorizationInteractor
  include Interactor

  # Reads:  context.current_user, context.target_user
  # Writes: nothing (fails context if employee tries to update another user's profile)

  def call
    return if context.current_user.manager? || context.current_user.executive?
    return if context.current_user == context.target_user

    context.fail!(message: "Forbidden. Insufficient permissions.", http_status: :forbidden)
  end
end
