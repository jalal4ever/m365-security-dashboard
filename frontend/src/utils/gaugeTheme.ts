export function getGaugeTheme(value: number) {
  if (value <= 33) {
    return {
      primary: '#e41712',
      secondary: '#f7b2ab',
      accent: '#a60f0f'
    }
  }

  if (value <= 65) {
    return {
      primary: '#caa37c',
      secondary: '#fde7c9',
      accent: '#8b5608'
    }
  }

  return {
    primary: '#8dcec1',
    secondary: '#e5f7f4',
    accent: '#164f4f'
  }
}
