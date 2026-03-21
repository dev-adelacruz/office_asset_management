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

  describe "seat availability" do
    it "is valid when seats are available" do
      license = create(:license, total_seats: 2)
      create(:license_seat, license: license)
      seat = build(:license_seat, license: license)
      expect(seat).to be_valid
    end

    it "is invalid when all seats are taken" do
      license = create(:license, total_seats: 1)
      create(:license_seat, license: license)
      seat = build(:license_seat, license: license)
      expect(seat).not_to be_valid
      expect(seat.errors[:base]).to include(/No seats available/)
    end

    it "does not enforce seat availability on update" do
      license = create(:license, total_seats: 1)
      seat = create(:license_seat, license: license)
      expect { seat.save! }.not_to raise_error
    end
  end
end
