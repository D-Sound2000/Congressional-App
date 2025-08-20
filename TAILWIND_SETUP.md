# Tailwind CSS Setup for React Native

This project has been configured with NativeWind (Tailwind CSS for React Native) to improve code readability and efficiency.

## Setup Files Created

1. **tailwind.config.js** - Tailwind configuration with custom colors and theme extensions
2. **babel.config.js** - Babel configuration with NativeWind plugin
3. **global.css** - Global CSS file with Tailwind directives
4. **nativewind-env.d.ts** - TypeScript declarations for NativeWind

## Dependencies Installed

- `nativewind` - Tailwind CSS for React Native
- `tailwindcss` - Core Tailwind CSS framework

## Usage

Instead of using StyleSheet.create(), you can now use Tailwind classes directly in the `className` prop:

```tsx
// Before (StyleSheet)
<View style={styles.container}>
  <Text style={styles.title}>Hello</Text>
</View>

// After (Tailwind)
<View className="flex-1 bg-white">
  <Text className="text-2xl font-bold text-gray-800">Hello</Text>
</View>
```

## Custom Colors

The configuration includes custom colors for the diabetes app:
- `primary-*` - Blue shades for primary elements
- `success-*` - Green shades for healthy readings
- `warning-*` - Yellow/Orange shades for warnings
- `danger-*` - Red shades for dangerous readings
- `dark-*` - Dark theme colors

## Theme Support

The app supports both light and dark themes using conditional Tailwind classes:

```tsx
<View className={`${isDark ? 'bg-dark-800' : 'bg-gray-50'}`}>
  <Text className={`${isDark ? 'text-white' : 'text-gray-800'}`}>
    Content
  </Text>
</View>
```

## Benefits

1. **Better Readability** - Classes are more descriptive than style objects
2. **Consistency** - Predefined design system with consistent spacing and colors
3. **Efficiency** - No need to create and maintain separate style objects
4. **Responsive Design** - Easy to implement responsive layouts
5. **Theme Support** - Built-in dark/light theme support 