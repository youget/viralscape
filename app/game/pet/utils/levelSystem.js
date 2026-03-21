export const checkLevelRequirements = (currentLevel, targetLevel, pet, totalClicks) => {
  const requirements = []

  for (let level = currentLevel + 1; level <= targetLevel; level++) {
    const req = {
      level,
      clicks: level * 1000,
      happiness: Math.min(10 + (level - 2), 90),
      health: Math.min(10 + (level - 2) * 2, 90),
      // ✅ FIX: Hunger requirement makin ketat di level tinggi
      hunger: Math.max(10, 30 - Math.floor(level / 10) * 5),
    }
    requirements.push(req)
  }

  const unmet = requirements.filter(
    (req) =>
      totalClicks < req.clicks ||
      pet.happiness < req.happiness ||
      pet.health < req.health ||
      pet.hunger > req.hunger
  )

  return {
    canLevelUp: unmet.length === 0,
    unmet,
    nextRequirement: requirements[0] || null,
  }
}

export const calculateBuyPrice = (fromLevel, toLevel, basePrice = 10000) => {
  const levelDiff = toLevel - fromLevel
  if (levelDiff <= 0) return 0

  let totalNormal = 0
  for (let i = fromLevel + 1; i <= toLevel; i++) {
    totalNormal += i * basePrice
  }

  // ✅ FIX: Formula kontinu — beli banyak level = premium lebih tinggi & konsisten
  const multiplier = 1 + (levelDiff - 1) * 0.7

  return Math.floor(totalNormal * multiplier)
}
