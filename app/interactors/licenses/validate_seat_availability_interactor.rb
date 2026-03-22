# frozen_string_literal: true

class Licenses::ValidateSeatAvailabilityInteractor
  include Interactor

  # Reads:  context.license
  # Writes: nothing (fails context if no seats available)
  def call
    return if context.license.seats_available > 0

    context.fail!(
      message: "No seats available. All #{context.license.total_seats} seat(s) are already assigned.",
      http_status: :unprocessable_entity
    )
  end
end
