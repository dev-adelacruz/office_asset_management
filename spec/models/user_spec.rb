# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User do
  describe '#validations' do
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_presence_of(:role) }
  end

  describe '#role' do
    it 'defaults to employee' do
      user = build(:user)
      expect(user.role).to eq('employee')
    end

    it 'accepts executive role' do
      user = build(:user, role: :executive)
      expect(user).to be_valid
      expect(user.role).to eq('executive')
    end

    it 'accepts manager role' do
      user = build(:user, role: :manager)
      expect(user).to be_valid
      expect(user.role).to eq('manager')
    end

    it 'accepts employee role' do
      user = build(:user, role: :employee)
      expect(user).to be_valid
      expect(user.role).to eq('employee')
    end

    it 'raises on invalid role' do
      expect { build(:user, role: :admin) }.to raise_error(ArgumentError)
    end

    it 'provides role predicate helpers' do
      expect(build(:user, role: :executive)).to be_executive
      expect(build(:user, role: :manager)).to be_manager
      expect(build(:user, role: :employee)).to be_employee
    end
  end
end
