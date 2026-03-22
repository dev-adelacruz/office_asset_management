# frozen_string_literal: true

class Licenses::ValidateUserExistsInteractor
  include Interactor

  # Reads:  context.user_email
  # Writes: context.user
  def call
    user = User.find_by(email: context.user_email)
    return context.user = user if user

    context.fail!(
      message: "User not found with email '#{context.user_email}'.",
      http_status: :not_found
    )
  end
end
