# frozen_string_literal: true

require "rails_helper"

RSpec.describe AssetRequests::PersistRejectionInteractor do
  let!(:asset_request) { create(:asset_request) }
  let(:note) { "Insufficient budget for this request." }

  subject(:result) { described_class.call(asset_request: asset_request, rejection_note: note) }

  it "succeeds" do
    expect(result).to be_success
  end

  it "sets the asset_request status to rejected" do
    result
    expect(asset_request.reload.status).to eq("rejected")
  end

  it "saves the rejection note" do
    result
    expect(asset_request.reload.notes).to eq(note)
  end

  it "writes to_status to context" do
    expect(result.to_status).to eq("rejected")
  end

  it "writes from_status to context" do
    expect(result.from_status).to eq("pending")
  end
end
