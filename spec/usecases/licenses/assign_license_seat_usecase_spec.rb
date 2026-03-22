# frozen_string_literal: true

require "rails_helper"

RSpec.describe Licenses::AssignLicenseSeatUsecase do
  let!(:license) { create(:license, total_seats: 3) }
  let!(:user) { create(:user, :employee) }

  subject(:result) { described_class.call(license: license, user_email: user_email) }

  describe "happy path" do
    let(:user_email) { user.email }

    it "succeeds" do
      expect(result).to be_success
    end

    it "creates a LicenseSeat" do
      expect { result }.to change(LicenseSeat, :count).by(1)
    end

    it "returns the seat on context" do
      expect(result.license_seat).to be_a(LicenseSeat)
    end
  end

  describe "user not found" do
    let(:user_email) { "ghost@example.com" }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "sets http_status to :not_found" do
      expect(result.http_status).to eq(:not_found)
    end

    it "rolls back — no seat created" do
      expect { result }.not_to change(LicenseSeat, :count)
    end
  end

  describe "no seats available" do
    let!(:full_license) { create(:license, total_seats: 1) }
    let!(:existing_user) { create(:user, :employee) }
    let!(:_seat) { create(:license_seat, license: full_license, user: existing_user) }
    let(:user_email) { user.email }

    subject(:result) { described_class.call(license: full_license, user_email: user_email) }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "includes 'No seats available' in the message" do
      expect(result.message).to include("No seats available")
    end

    it "rolls back — no seat created" do
      expect { result }.not_to change(LicenseSeat, :count)
    end
  end
end
