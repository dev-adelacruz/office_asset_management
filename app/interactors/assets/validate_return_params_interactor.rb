# frozen_string_literal: true

class Assets::ValidateReturnParamsInteractor
  include Interactor

  # Reads:  context.assignment_log
  # Writes: nothing (fails context if already returned)
  def call
    return unless context.assignment_log.returned_at.present?

    context.fail!(message: "This assignment has already been returned.")
  end
end
