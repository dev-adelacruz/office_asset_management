# frozen_string_literal: true

class Assets::PersistReturnInteractor
  include Interactor

  # Reads:  context.assignment_log
  # Writes: context.assignment_log (marked as returned)
  def call
    context.assignment_log.update!(returned_at: Time.current)
  end
end
