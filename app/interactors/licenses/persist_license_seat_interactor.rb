# frozen_string_literal: true

class Licenses::PersistLicenseSeatInteractor
  include Interactor

  # Reads:  context.license, context.user
  # Writes: context.license_seat
  def call
    seat = LicenseSeat.new(license: context.license, user: context.user)
    seat.save!
    context.license_seat = seat
  rescue ActiveRecord::RecordInvalid => e
    context.fail!(message: e.record.errors.full_messages.join(", "), http_status: :unprocessable_entity)
  end
end
