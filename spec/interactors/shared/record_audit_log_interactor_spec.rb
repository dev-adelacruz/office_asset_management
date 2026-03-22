# frozen_string_literal: true

require "rails_helper"

RSpec.describe Shared::RecordAuditLogInteractor do
  let!(:user) { create(:user, :employee) }
  let!(:asset) { create(:asset) }

  subject(:result) do
    described_class.call(
      current_user: user,
      auditable: asset,
      audit_action: "create",
      changes_before: {},
      changes_after: { "name" => "Laptop" }
    )
  end

  it "succeeds" do
    expect(result).to be_success
  end

  it "creates an AuditLog record" do
    expect { result }.to change(AuditLog, :count).by(1)
  end

  it "sets the correct actor" do
    expect(result.success? && AuditLog.last.actor).to eq(user)
  end

  it "sets the correct auditable" do
    result
    expect(AuditLog.last.auditable).to eq(asset)
  end

  it "sets the correct action" do
    result
    expect(AuditLog.last.action).to eq("create")
  end

  it "sets changes_before and changes_after" do
    result
    log = AuditLog.last
    expect(log.changes_before).to eq({})
    expect(log.changes_after).to eq({ "name" => "Laptop" })
  end

  describe "when AuditLog.create! raises" do
    before do
      allow(AuditLog).to receive(:create!).and_raise(ActiveRecord::RecordInvalid)
    end

    it "propagates the exception (causing the transaction to roll back)" do
      expect { result }.to raise_error(ActiveRecord::RecordInvalid)
    end
  end
end
