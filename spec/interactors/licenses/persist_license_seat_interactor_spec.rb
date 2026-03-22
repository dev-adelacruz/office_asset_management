# frozen_string_literal: true

require "rails_helper"

RSpec.describe Licenses::PersistLicenseSeatInteractor do
  let!(:license) { create(:license, total_seats: 5) }
  let!(:user) { create(:user, :employee) }

  subject(:result) { described_class.call(license: license, user: user) }

  it "succeeds" do
    expect(result).to be_success
  end

  it "creates a LicenseSeat record" do
    expect { result }.to change(LicenseSeat, :count).by(1)
  end

  it "writes the seat to context.license_seat" do
    expect(result.license_seat).to be_a(LicenseSeat)
    expect(result.license_seat).to be_persisted
  end

  it "associates the seat with the correct user and license" do
    expect(result.license_seat.user).to eq(user)
    expect(result.license_seat.license).to eq(license)
  end

  describe "when the user is already assigned" do
    let!(:existing_seat) { create(:license_seat, license: license, user: user) }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "includes 'already assigned' in the message" do
      expect(result.message).to include("already assigned")
    end
  end
end
