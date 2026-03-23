# frozen_string_literal: true

class Users::ValidateAdminEmailChangeInteractor
  include Interactor

  # Reads:  context.current_user, context.new_email
  # Writes: nothing (fails context if caller lacks permissions or email is invalid)

  def call
    unless context.current_user.manager? || context.current_user.executive?
      context.fail!(message: "Forbidden. Insufficient permissions.", http_status: :forbidden)
      return
    end

    if context.new_email.blank?
      context.fail!(message: "Email can't be blank.")
      return
    end

    if context.new_email == context.target_user.email
      context.fail!(message: "New email must differ from the current email.")
      return
    end

    if User.exists?(email: context.new_email)
      context.fail!(message: "Email is already taken.")
    end
  end
end
