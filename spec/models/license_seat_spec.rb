# frozen_string_literal: true

require "rails_helper"

RSpec.describe LicenseSeat do
  describe "validations" do
    subject { build(:license_seat) }

    it { is_expected.to validate_uniqueness_of(:user_id).scoped_to(:license_id).with_message("is already assigned to this license") }
  end

  describe "associations" do
    it { is_expected.to belong_to(:license) }
    it { is_expected.to belong_to(:user) }
  end

  # Seat availability enforcement moved to Licenses::ValidateSeatAvailabilityInteractor (OAM2-60)
end
