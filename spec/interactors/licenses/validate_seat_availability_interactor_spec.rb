# frozen_string_literal: true

require "rails_helper"

RSpec.describe Licenses::ValidateSeatAvailabilityInteractor do
  subject(:result) { described_class.call(license: license) }

  describe "when seats are available" do
    let!(:license) { create(:license, total_seats: 3) }

    it "succeeds" do
      expect(result).to be_success
    end
  end

  describe "when zero seats remain" do
    let!(:license) { create(:license, total_seats: 1) }
    let!(:seat) { create(:license_seat, license: license) }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "sets http_status to :unprocessable_entity" do
      expect(result.http_status).to eq(:unprocessable_entity)
    end

    it "includes 'No seats available' in the message" do
      expect(result.message).to include("No seats available")
    end
  end

  describe "when over capacity" do
    let!(:license) { create(:license, total_seats: 2) }
    let!(:seats) { create_list(:license_seat, 2, license: license) }

    it "fails the context" do
      expect(result).to be_failure
    end
  end
end
