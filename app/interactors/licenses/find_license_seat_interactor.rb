# frozen_string_literal: true

class Licenses::FindLicenseSeatInteractor
  include Interactor

  # Reads:  context.license, context.seat_id
  # Writes: context.license_seat
  def call
    context.license_seat = context.license.license_seats.find(context.seat_id)
  rescue ActiveRecord::RecordNotFound
    context.fail!(message: "Seat not found.", http_status: :not_found)
  end
end
