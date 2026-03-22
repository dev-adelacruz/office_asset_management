# frozen_string_literal: true

require "rails_helper"

RSpec.describe License do
  describe "validations" do
    it { is_expected.to validate_presence_of(:software_name) }
    it { is_expected.to validate_presence_of(:vendor) }
    it { is_expected.to validate_presence_of(:license_key) }
    it { is_expected.to validate_presence_of(:total_seats) }
    it { is_expected.to validate_numericality_of(:total_seats).only_integer.is_greater_than(0) }
    it { is_expected.to validate_presence_of(:cost) }
    it { is_expected.to validate_numericality_of(:cost).is_greater_than_or_equal_to(0) }
    it { is_expected.to validate_presence_of(:expiry_date) }
  end

  describe "associations" do
    it { is_expected.to have_many(:license_seats).dependent(:destroy) }
    it { is_expected.to have_many(:users).through(:license_seats) }
    it { is_expected.to have_many(:notifications).dependent(:destroy) }
  end

  describe "#status" do
    it "returns 'expired' when expiry_date is in the past" do
      license = build(:license, expiry_date: Date.today - 1)
      expect(license.status).to eq("expired")
    end

    it "returns 'expiring_soon' when expiry_date is within 30 days" do
      license = build(:license, expiry_date: Date.today + 15)
      expect(license.status).to eq("expiring_soon")
    end

    it "returns 'active' when expiry_date is beyond 30 days" do
      license = build(:license, expiry_date: Date.today + 60)
      expect(license.status).to eq("active")
    end
  end

  describe "#seats_used and #seats_available" do
    it "returns correct counts based on license_seats" do
      license = create(:license, total_seats: 5)
      create_list(:license_seat, 2, license: license)

      expect(license.seats_used).to eq(2)
      expect(license.seats_available).to eq(3)
    end
  end
end
