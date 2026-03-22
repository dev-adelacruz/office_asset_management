# frozen_string_literal: true

require "rails_helper"

RSpec.describe Licenses::RemoveLicenseSeatUsecase do
  let!(:license) { create(:license) }

  subject(:result) { described_class.call(license: license, seat_id: seat_id) }

  describe "happy path" do
    let!(:seat) { create(:license_seat, license: license) }
    let(:seat_id) { seat.id }

    it "succeeds" do
      expect(result).to be_success
    end

    it "destroys the seat" do
      expect { result }.to change(LicenseSeat, :count).by(-1)
    end
  end

  describe "seat not found" do
    let(:seat_id) { 0 }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "sets http_status to :not_found" do
      expect(result.http_status).to eq(:not_found)
    end
  end
end
