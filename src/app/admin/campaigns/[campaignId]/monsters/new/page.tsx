'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Action {
  name: string
  description: string
}

interface Trait {
  name: string
  description: string
}

export default function NewMonsterPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.campaignId as string
  const [loading, setLoading] = useState(false)

  // Basic Info
  const [name, setName] = useState('')
  const [size, setSize] = useState('Medium')
  const [type, setType] = useState('Humanoid')
  const [alignment, setAlignment] = useState('Neutral')
  const [cr, setCr] = useState('1')

  // Stats
  const [ac, setAc] = useState('12')
  const [acType, setAcType] = useState('Natural Armor')
  const [hp, setHp] = useState('22')
  const [hitDice, setHitDice] = useState('4d8+4')
  const [speed, setSpeed] = useState('30 ft.')

  // Ability Scores
  const [str, setStr] = useState('10')
  const [dex, setDex] = useState('10')
  const [con, setConst] = useState('10')
  const [int, setInt] = useState('10')
  const [wis, setWis] = useState('10')
  const [cha, setCha] = useState('10')

  // Optional fields
  const [saves, setSaves] = useState('')
  const [skills, setSkills] = useState('')
  const [resistances, setResistances] = useState('')
  const [immunities, setImmunities] = useState('')
  const [senses, setSenses] = useState('Passive Perception 10')
  const [languages, setLanguages] = useState('')

  // Traits and Actions
  const [traits, setTraits] = useState<Trait[]>([])
  const [actions, setActions] = useState<Action[]>([])

  // Image
  const [imageUrl, setImageUrl] = useState('')

  const calculateModifier = (score: string) => {
    const num = parseInt(score) || 10
    const mod = Math.floor((num - 10) / 2)
    return mod >= 0 ? `+${mod}` : `${mod}`
  }

  const addTrait = () => {
    setTraits([...traits, { name: '', description: '' }])
  }

  const removeTrait = (index: number) => {
    setTraits(traits.filter((_, i) => i !== index))
  }

  const updateTrait = (index: number, field: 'name' | 'description', value: string) => {
    const updated = [...traits]
    updated[index][field] = value
    setTraits(updated)
  }

  const addAction = () => {
    setActions([...actions, { name: '', description: '' }])
  }

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index))
  }

  const updateAction = (index: number, field: 'name' | 'description', value: string) => {
    const updated = [...actions]
    updated[index][field] = value
    setActions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const monsterData = {
        name,
        size,
        type,
        alignment,
        cr,
        ac,
        acType,
        hp,
        hitDice,
        speed,
        abilityScores: { str, dex, con: con, int, wis, cha },
        saves,
        skills,
        resistances,
        immunities,
        senses,
        languages,
        traits,
        actions,
        imageUrl,
      }

      const response = await fetch(`/api/campaigns/${campaignId}/monsters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(monsterData),
      })

      if (response.ok) {
        router.push(`/admin/campaigns/${campaignId}`)
      } else {
        alert('Failed to create monster')
      }
    } catch (error) {
      console.error('Error creating monster:', error)
      alert('Error creating monster')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/admin/campaigns/${campaignId}`}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ← Back to Campaign
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-purple-400">Create Monster Stat Block</h1>
            <p className="text-gray-400 mt-1">Campaign: {campaignId}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Monster Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                           focus:border-purple-500 focus:outline-none text-white"
                  placeholder="Goblin"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Size</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                             focus:border-purple-500 focus:outline-none text-white"
                  >
                    <option>Tiny</option>
                    <option>Small</option>
                    <option>Medium</option>
                    <option>Large</option>
                    <option>Huge</option>
                    <option>Gargantuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Type</label>
                  <input
                    type="text"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                             focus:border-purple-500 focus:outline-none text-white"
                    placeholder="Humanoid, Fey, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Alignment
                  </label>
                  <input
                    type="text"
                    value={alignment}
                    onChange={(e) => setAlignment(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                             focus:border-purple-500 focus:outline-none text-white"
                    placeholder="Neutral Evil"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Image URL (optional)
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                           focus:border-purple-500 focus:outline-none text-white font-mono text-sm"
                  placeholder="/campaigns/your-campaign/img/monster.jpg"
                />
              </div>
            </div>
          </div>

          {/* Combat Stats */}
          <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Combat Stats</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Armor Class
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ac}
                    onChange={(e) => setAc(e.target.value)}
                    className="w-24 px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                             focus:border-purple-500 focus:outline-none text-white"
                    placeholder="12"
                  />
                  <input
                    type="text"
                    value={acType}
                    onChange={(e) => setAcType(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                             focus:border-purple-500 focus:outline-none text-white"
                    placeholder="Natural Armor"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Speed</label>
                <input
                  type="text"
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                           focus:border-purple-500 focus:outline-none text-white"
                  placeholder="30 ft., fly 60 ft."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Hit Points
                </label>
                <input
                  type="text"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                           focus:border-purple-500 focus:outline-none text-white"
                  placeholder="22"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Hit Dice
                </label>
                <input
                  type="text"
                  value={hitDice}
                  onChange={(e) => setHitDice(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                           focus:border-purple-500 focus:outline-none text-white"
                  placeholder="4d8+4"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Challenge Rating
                </label>
                <input
                  type="text"
                  value={cr}
                  onChange={(e) => setCr(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                           focus:border-purple-500 focus:outline-none text-white"
                  placeholder="1"
                />
              </div>
            </div>
          </div>

          {/* Ability Scores */}
          <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Ability Scores</h2>

            <div className="grid grid-cols-6 gap-3">
              {[
                { label: 'STR', value: str, setter: setStr },
                { label: 'DEX', value: dex, setter: setDex },
                { label: 'CON', value: con, setter: setConst },
                { label: 'INT', value: int, setter: setInt },
                { label: 'WIS', value: wis, setter: setWis },
                { label: 'CHA', value: cha, setter: setCha },
              ].map((ability) => (
                <div key={ability.label}>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 text-center">
                    {ability.label}
                  </label>
                  <input
                    type="number"
                    value={ability.value}
                    onChange={(e) => ability.setter(e.target.value)}
                    className="w-full px-2 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                             focus:border-purple-500 focus:outline-none text-white text-center"
                  />
                  <div className="text-center text-sm text-purple-400 mt-1">
                    ({calculateModifier(ability.value)})
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Saving Throws
                </label>
                <input
                  type="text"
                  value={saves}
                  onChange={(e) => setSaves(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                           focus:border-purple-500 focus:outline-none text-white"
                  placeholder="Dex +4, Wis +2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Skills</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                           focus:border-purple-500 focus:outline-none text-white"
                  placeholder="Stealth +6, Perception +2"
                />
              </div>
            </div>
          </div>

          {/* Additional Properties */}
          <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Additional Properties</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Damage Resistances
                </label>
                <input
                  type="text"
                  value={resistances}
                  onChange={(e) => setResistances(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                           focus:border-purple-500 focus:outline-none text-white"
                  placeholder="Fire, Cold"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Damage Immunities
                </label>
                <input
                  type="text"
                  value={immunities}
                  onChange={(e) => setImmunities(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                           focus:border-purple-500 focus:outline-none text-white"
                  placeholder="Poison"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Senses</label>
                <input
                  type="text"
                  value={senses}
                  onChange={(e) => setSenses(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                           focus:border-purple-500 focus:outline-none text-white"
                  placeholder="Darkvision 60 ft., Passive Perception 12"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Languages</label>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                           focus:border-purple-500 focus:outline-none text-white"
                  placeholder="Common, Goblin"
                />
              </div>
            </div>
          </div>

          {/* Traits */}
          <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Traits</h2>
              <button
                type="button"
                onClick={addTrait}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
              >
                + Add Trait
              </button>
            </div>

            <div className="space-y-4">
              {traits.map((trait, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <input
                      type="text"
                      value={trait.name}
                      onChange={(e) => updateTrait(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded
                               focus:border-purple-500 focus:outline-none text-white font-semibold"
                      placeholder="Trait Name"
                    />
                    <button
                      type="button"
                      onClick={() => removeTrait(index)}
                      className="ml-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/40 rounded text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={trait.description}
                    onChange={(e) => updateTrait(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded
                             focus:border-purple-500 focus:outline-none text-white"
                    rows={2}
                    placeholder="Description (use <DiceNotation value='DC 15' /> for dice)"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Actions</h2>
              <button
                type="button"
                onClick={addAction}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
              >
                + Add Action
              </button>
            </div>

            <div className="space-y-4">
              {actions.map((action, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <input
                      type="text"
                      value={action.name}
                      onChange={(e) => updateAction(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded
                               focus:border-purple-500 focus:outline-none text-white font-semibold"
                      placeholder="Action Name"
                    />
                    <button
                      type="button"
                      onClick={() => removeAction(index)}
                      className="ml-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/40 rounded text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={action.description}
                    onChange={(e) => updateAction(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded
                             focus:border-purple-500 focus:outline-none text-white"
                    rows={2}
                    placeholder="Description (e.g., Melee Attack: <DiceNotation value='+5' /> to hit, Hit: <DiceNotation value='1d8+3' /> damage)"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !name}
              className="flex-1 px-6 py-4 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700
                       disabled:cursor-not-allowed rounded-lg font-semibold text-lg
                       transition-colors duration-200"
            >
              {loading ? 'Creating Monster...' : 'Create Monster'}
            </button>
            <Link
              href={`/admin/campaigns/${campaignId}`}
              className="px-6 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-lg
                       transition-colors duration-200 text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
