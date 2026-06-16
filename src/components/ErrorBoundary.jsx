import { Component } from 'react'

/** Never let an optional visual (e.g. WebGL) take down the page. */
export class SafeBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err) {
    // swallow · the fallback (CSS) carries the design
    if (import.meta.env.DEV) console.warn('[SafeBoundary] visual disabled:', err?.message)
  }
  render() {
    if (this.state.failed) return this.props.fallback ?? null
    return this.props.children
  }
}
