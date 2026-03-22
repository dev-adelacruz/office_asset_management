# frozen_string_literal: true

class Licenses::DestroyLicenseSeatInteractor
  include Interactor

  # Reads:  context.license_seat
  # Writes: nothing
  def call
    context.license_seat.destroy!
  end
end
