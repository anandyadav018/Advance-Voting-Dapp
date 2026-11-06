import React from "react";
import { FiTrendingUp, FiTrendingDown, FiMinus } from "react-icons/fi";

const StatsCard = ({
  title,
  value,
  icon: Icon,
  color = "blue",
  subtitle,
  className = "",
  trend,
  trendValue,
  isLoading = false,
  size = "default",
  variant = "default",
  ...props
}) => {
  const colorConfig = {
    blue: {
      gradient: "from-blue-500 to-blue-600",
      lightBg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-600 dark:text-blue-400",
      ring: "ring-blue-200 dark:ring-blue-800",
    },
    green: {
      gradient: "from-green-500 to-emerald-600",
      lightBg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-600 dark:text-green-400",
      ring: "ring-green-200 dark:ring-green-800",
    },
    purple: {
      gradient: "from-purple-500 to-indigo-600",
      lightBg: "bg-purple-50 dark:bg-purple-950/30",
      border: "border-purple-200 dark:border-purple-800",
      text: "text-purple-600 dark:text-purple-400",
      ring: "ring-purple-200 dark:ring-purple-800",
    },
    red: {
      gradient: "from-red-500 to-rose-600",
      lightBg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-600 dark:text-red-400",
      ring: "ring-red-200 dark:ring-red-800",
    },
    yellow: {
      gradient: "from-yellow-500 to-orange-500",
      lightBg: "bg-yellow-50 dark:bg-yellow-950/30",
      border: "border-yellow-200 dark:border-yellow-800",
      text: "text-yellow-600 dark:text-yellow-400",
      ring: "ring-yellow-200 dark:ring-yellow-800",
    },
    indigo: {
      gradient: "from-indigo-500 to-purple-600",
      lightBg: "bg-indigo-50 dark:bg-indigo-950/30",
      border: "border-indigo-200 dark:border-indigo-800",
      text: "text-indigo-600 dark:text-indigo-400",
      ring: "ring-indigo-200 dark:ring-indigo-800",
    },
  };

  const sizeConfig = {
    compact: {
      container: "p-4",
      icon: "w-12 h-12 p-2",
      iconSize: "h-6 w-6",
      title: "text-xs",
      value: "text-xl",
      subtitle: "text-xs",
    },
    default: {
      container: "p-6",
      icon: "w-16 h-16 p-3",
      iconSize: "h-8 w-8",
      title: "text-sm",
      value: "text-3xl",
      subtitle: "text-sm",
    },
    large: {
      container: "p-8",
      icon: "w-20 h-20 p-4",
      iconSize: "h-10 w-10",
      title: "text-base",
      value: "text-4xl",
      subtitle: "text-base",
    },
  };

  const config = colorConfig[color] || colorConfig.blue; // Fallback to blue if color not found
  const sizing = sizeConfig[size];

  const variantConfig = {
    default:
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    gradient: `bg-gradient-to-br ${config.lightBg} border ${config.border}`,
    outlined: `bg-transparent border-2 ${config.border}`,
    filled: `bg-gradient-to-r ${config.gradient} text-white border-0`,
  };

  const getTrendIcon = () => {
    if (trend === "up") return FiTrendingUp;
    if (trend === "down") return FiTrendingDown;
    return FiMinus;
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-green-600 dark:text-green-400";
    if (trend === "down") return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const TrendIcon = getTrendIcon();

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl transition-all duration-300 
        hover:-translate-y-1 hover:shadow-xl group cursor-pointer
        ${variantConfig[variant]} ${sizing.container} ${className}
      `}
      {...props}
    >
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 dark:via-gray-800 transition-opacity duration-500"></div>

      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${
              config.text.includes("blue") ? "rgb(59 130 246)" : "currentColor"
            } 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Title */}
            <div className="flex items-center space-x-2 mb-2">
              <p
                className={`${sizing.title} font-semibold ${
                  variant === "filled"
                    ? "text-white/90"
                    : "text-gray-600 dark:text-gray-400"
                } uppercase tracking-wide`}
              >
                {title}
              </p>
              {isLoading && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50"></div>
              )}
            </div>

            {/* Value with Loading State */}
            <div className="mb-2">
              {isLoading ? (
                <div className="space-y-2">
                  <div
                    className={`h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse`}
                  ></div>
                  <div
                    className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse`}
                  ></div>
                </div>
              ) : (
                <>
                  <p
                    className={`${sizing.value} font-bold ${
                      variant === "filled"
                        ? "text-white"
                        : "text-gray-900 dark:text-white"
                    } transition-all duration-300 group-hover:scale-105`}
                  >
                    {value}
                  </p>

                  {/* Subtitle and Trend */}
                  {(subtitle || trend) && (
                    <div className="flex items-center justify-between mt-2">
                      {subtitle && (
                        <p
                          className={`${sizing.subtitle} ${
                            variant === "filled"
                              ? "text-white/80"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {subtitle}
                        </p>
                      )}

                      {trend && trendValue && (
                        <div
                          className={`flex items-center space-x-1 ${getTrendColor()}`}
                        >
                          <TrendIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {typeof trendValue === "number"
                              ? `${trendValue > 0 ? "+" : ""}${trendValue}%`
                              : trendValue}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Icon */}
          <div className="relative">
            <div
              className={`
              ${sizing.icon} rounded-2xl shadow-lg transition-all duration-300 
              group-hover:scale-110 group-hover:rotate-3
              ${
                variant === "filled"
                  ? "bg-white/20 backdrop-blur-sm"
                  : `bg-gradient-to-r ${config.gradient}`
              }
            `}
            >
              <Icon
                className={`${sizing.iconSize} ${
                  variant === "filled" ? "text-white" : "text-white"
                }`}
              />
            </div>

            {/* Pulse Effect for Important Stats */}
            {trend === "up" && (
              <div className="absolute inset-0 rounded-2xl bg-green-400 animate-ping opacity-25"></div>
            )}
          </div>
        </div>

        {/* Progress Bar (Optional) */}
        {trend &&
          typeof trendValue === "number" &&
          Math.abs(trendValue) > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span
                  className={
                    variant === "filled"
                      ? "text-white/80"
                      : "text-gray-500 dark:text-gray-400"
                  }
                >
                  Change
                </span>
                <span className={getTrendColor()}>
                  {trendValue > 0 ? "+" : ""}
                  {trendValue}%
                </span>
              </div>
              <div
                className={`w-full h-2 rounded-full ${
                  variant === "filled"
                    ? "bg-white/20"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                    trend === "up" ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(Math.abs(trendValue), 100)}%` }}
                ></div>
              </div>
            </div>
          )}

        {/* Bottom Highlight Line */}
        <div
          className={`
          absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient} 
          transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 
          rounded-b-2xl
        `}
        ></div>
      </div>

      {/* Corner Accent */}
      <div
        className={`
        absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${config.gradient} 
        rounded-full transform translate-x-10 -translate-y-10 opacity-10 
        group-hover:opacity-20 transition-opacity duration-300
      `}
      ></div>
    </div>
  );
};

export default StatsCard;
