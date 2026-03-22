# frozen_string_literal: true

require "rails_helper"

RSpec.describe AssetRequests::PersistApprovalInteractor do
  let!(:asset_request) { create(:asset_request) }

  subject(:result) { described_class.call(asset_request: asset_request) }

  it "succeeds" do
    expect(result).to be_success
  end

  it "sets the asset_request status to approved" do
    result
    expect(asset_request.reload.status).to eq("approved")
  end

  it "writes to_status to context" do
    expect(result.to_status).to eq("approved")
  end

  it "writes from_status to context" do
    expect(result.from_status).to eq("pending")
  end
end
