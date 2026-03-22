# frozen_string_literal: true

require "rails_helper"

RSpec.describe AssetRequests::LogAssetRequestStatusInteractor do
  let!(:user) { create(:user, :employee) }
  let!(:asset_request) { create(:asset_request, user: user) }

  subject(:result) do
    described_class.call(
      asset_request: asset_request,
      current_user: user,
      to_status: "pending",
      from_status: nil
    )
  end

  it "succeeds" do
    expect(result).to be_success
  end

  it "creates an AssetRequestStatusLog" do
    expect { result }.to change(AssetRequestStatusLog, :count).by(1)
  end

  it "writes asset_request_status_log to context" do
    expect(result.asset_request_status_log).to be_a(AssetRequestStatusLog)
    expect(result.asset_request_status_log).to be_persisted
  end

  it "sets the correct to_status" do
    expect(result.asset_request_status_log.to_status).to eq("pending")
  end

  it "sets the correct changed_by" do
    expect(result.asset_request_status_log.changed_by).to eq(user)
  end

  it "sets from_status to nil for initial log" do
    expect(result.asset_request_status_log.from_status).to be_nil
  end
end
